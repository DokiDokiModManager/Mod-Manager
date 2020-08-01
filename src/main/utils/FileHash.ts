import {createHash, Hash} from "crypto";
import {createReadStream, ReadStream} from "fs";

export default class FileHash {
    /**
     * Hash a file and return the hex digest. Not safe against timing attacks.
     * @param file Path to the file
     * @param algorithm Which algorithm to use
     */
    static hash(file: string, algorithm: string): Promise<string> {
        return new Promise((ff, rj) => {
            const hash: Hash = createHash(algorithm);
            const fileStream: ReadStream = createReadStream(file);

            fileStream.on("data", chunk => {
                hash.update(chunk);
            });

            fileStream.on("end", () => {
                ff(hash.digest("hex"));
            });
        });
    }
}
