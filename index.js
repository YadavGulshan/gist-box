"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var rest_1 = require("@octokit/rest");
var humanize = require("humanize-number");
var _a = process.env,
  gistId = _a.GIST_ID,
  githubToken = _a.GH_TOKEN,
  considerPrivate = _a.CONSIDER_PRIVATE;
var octokit = new rest_1.Octokit({
  auth: "token " + githubToken,
});
