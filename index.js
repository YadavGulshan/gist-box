"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const rest_1 = require("@octokit/rest");
const axios_1 = __importDefault(require("axios"));
const humanize = require("humanize-number");
const {
  GIST_ID: gistId,
  GH_TOKEN: githubToken,
  CONSIDER_PRIVATE: considerPrivate,
} = process.env;
const octokit = new rest_1.Octokit({
  auth: `token ${githubToken}`,
});
async function formatBytes(props) {
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
  const contributionData = await (0, axios_1.default)(
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
  // Append the public repos
  arr.push(userData.public_repos);
  isPrivate
    ? userData.owned_private_repos != null
      ? arr.push(userData.owned_private_repos)
      : arr.push(0)
    : arr.push(userData.public_repos);
}
(async () => {
  await main();
})();
