require("dotenv").config();
import { Octokit } from "@octokit/rest";
import axios from "axios";
const humanize = require("humanize-number");

const {
  GIST_ID: gistId,
  GH_TOKEN: githubToken,
  CONSIDER_PRIVATE: considerPrivate,
} = process.env;

const octokit = new Octokit({
  auth: `token ${githubToken}`,
});

async function formatBytes(props: { bytes: number | 0; decimals: number | 0 }) {
  if (props.bytes == 0) return "0 bytes";
  const k = 1024;
  const dm = props.decimals < 0 ? 0 : props.decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(props.bytes) / Math.log(k));
  return (
    parseFloat((props.bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
}

async function main() {
  const arr = [];
  const isPrivate = considerPrivate === "true";
  const userDataRaw = await octokit.users.getAuthenticated();
  const userData = userDataRaw.data;
  const contributionData = await axios(
    `https://github-contributions.now.sh/api/v1/${userData.login}`
  );
  const pkDataRaw = await octokit.users.listPublicKeysForUser({
    username: userData.login,
  });

  arr.push(userData.disk_usage);
  // If arr is undefined, then the user has no disk usage
  if (arr[0] !== undefined) {
    const diskUsage = await formatBytes({
      bytes: arr[0],
      decimals: 2,
    });
    console.log(`Disk Usage: ${diskUsage}`);
  }

  // If isPrivate is true then append total no. private and public repos too into the array
  // else only append public repos
  isPrivate
    ? userData.owned_private_repos != undefined
      ? arr.push(userData.public_repos + userData.owned_private_repos)
      : arr.push(0)
    : arr.push(userData.public_repos);

  // Append the total no. of contributions in current year
  arr.push(contributionData.data.years[0].total);

  // Append the year
  arr.push(contributionData.data.years[0].year);

  // Adding into the array, if user is looking for a job or not.
  userData.hireable
    ? arr.push("💼 Looking for a job")
    : arr.push("💼 Not looking for a job");

  // Append the no. of public gists
  arr.push(userData.public_gists);

  // Append the no. of public keys
  arr.push(pkDataRaw.data.length);

  await updateGist(arr);
}

async function updateGist(data: any[]) {
  let gist;

  /// iF gist id is present then set the gist variable
  // else end the program
  if (gistId != undefined) {
    try {
      gist = await octokit.gists.get({
        gist_id: gistId,
      });
    } catch (err) {
      console.log(err);
    }
  } else return;

  const lines: string[] = [];

  // number of contributions in year
  const contributionPoint = [
    `🏆 ${humanize(data[2])} contributions in ${data[3]}`,
  ];

  // If directely appended, the [line] array will be like,
  // [['data']]
  // So, we need to flatten it
  //
  // We can use for each loop...
  // ```
  // contributionPoint.forEach((line) => {
  //     lines.push(line);
  // });
  // ```
  // Or this way,
  lines.push(contributionPoint.join(""));

  // disk usage
  const totalDiskUsage = [`📦 Used ${data[0]} in GitHub's Storage`];

  lines.push(totalDiskUsage.join(" "));

  // public gists
  const publicGists = [`📜 ${data[5]} Public Gists`];

  lines.push(publicGists.join(" "));

  // public keys
  const publicKeys = [`🔑 ${data[6]} Public Keys`];

  lines.push(publicKeys.join(" "));

  // Is Hireable?
  const isHireable = [data[4]];

  lines.push(isHireable.join(" "));

  // Adding the [lines] array into the gist file
  if (lines.length != 0) {
    try {
      console.log(lines.join("\n"));

      const filename =
        gist != undefined
          ? gist.data.files != undefined
            ? Object.keys(gist.data.files)[0]
            : "File not found"
          : "";

      await octokit.gists.update({
        gist_id: gistId,
        files: {
          [filename]: {
            filename: `🐱 GitHub Data`,
            content: lines.join("\n"),
          },
        },
      });
    } catch (err) {
      console.error(`Unable to update gist\n${err}`);
    }
  }
}

(async () => {
  await main();
})();
