import FileHash from "../utils/FileHash";

// final version
const casesDataRaw = `
# This file specifies special case installation actions for some mods.
# Empty lines and lines beginning with # are ignored.
# Format - tab delimited: [sha1-hash] (preinstall|postinstall) (delete) [file-path]

# Deletion Rewrite
1e4f7f42f6e9b198063bc64f7c1b38a555706851\tpostinstall\tdelete\tgame/scripts.rpa

# Dimensions
e967ecc313f2f92b434f8ff8464d8dc8f634fa01\tpostinstall\tdelete\tgame/scripts.rpa

# Just Yuri
c766d2251365ad145c8987d59bfff3cd89f58c0e\tpostinstall\tdelete\tgame/scripts.rpa

# Club Meetings Season 1
5fb3e9cc250c78b3f19e1af1e8fb8d485d4bf1c5\tpostinstall\tdelete\tgame/scripts.rpa

# Second Chances
96f54d546ae8f5fee03ba4c4f2ad7bad8a92dabe\tpostinstall\tdelete\tgame/scripts.rpa
`.trim();

export default class SpecialCaseManager {

    private specialCasesData: any = {};

    constructor() {
        const lines = casesDataRaw.split("\n").filter(line => line && !line.startsWith("#"));

        lines.forEach(line => {
            const [hash, time, action, parameter] = line.split("\t");
            if (!this.specialCasesData[hash]) {
                this.specialCasesData[hash] = [];
            }
            this.specialCasesData[hash].push({time, action, parameter});
        });
    }

    async get(path: string): Promise<any[]> {
        if (global.ddmm_constants.special_cases_disabled) return [];
        const hash = await FileHash.hash(path, "sha1");
        return this.specialCasesData[hash] ? this.specialCasesData[hash] : [];
    }
}
