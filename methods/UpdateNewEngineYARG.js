import fs from "fs/promises";
import { GetSortedReleases } from "../utils/Github.js";
import { NEWENGINEYARG_RELEASES_PATH } from "../utils/const.js";

const data = await GetSortedReleases("YARC-Official", "YARG-NewEngine");
const releases = data.repository.releases.nodes;

await fs.writeFile(NEWENGINEYARG_RELEASES_PATH, JSON.stringify(releases, null, 2));
