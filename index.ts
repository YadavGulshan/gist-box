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
