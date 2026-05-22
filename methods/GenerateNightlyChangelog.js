import fs from "fs/promises";
import path from "path";

import { NIGHTLYYARG_CHANGELOG_FOLDER } from "../utils/const.js";
import { GetCommits, GetSortedReleases } from "../utils/Github.js";

const data = await GetSortedReleases("YARC-Official", "YARG-BleedingEdge", 2);
const releases = data.repository.releases.nodes;

if(releases.length < 2) {
    console.log("::error Less then two releases received");
    process.exit(1);
}

const currentTag = releases[0]?.tagName;
const currentTimestamp = releases[0]?.publishedAt;
const previousTimestamp = releases[1]?.publishedAt;

const commits = await GetCommits("YARC-Official", "YARG", "dev", previousTimestamp, currentTimestamp);
const formattedCommits = commits.map(commit => {
    const separator = "\n";
    const summary = commit.message.split(separator)[0].trim();
    const description = commit.message.substring(summary.length).trim();

    return {
        sha: commit.oid,
        author: commit.author?.user?.login ?? commit.author?.name ?? null,
        summary,
        description,
    }
});

const output = {
    commits: formattedCommits
};

const savePath = path.join(NIGHTLYYARG_CHANGELOG_FOLDER, currentTag);
await fs.writeFile(savePath, JSON.stringify(output, null, 2));
