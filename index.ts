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
  console.log(`${userData.login} (${userData.name})`);
}

(async () => {
  await main();
})();
