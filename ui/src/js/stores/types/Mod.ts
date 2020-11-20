import ModStore from "./ModStore";

export default class Mod {
    id: string;
    name: string;
    author: string;
    description: string;
    icon?: string;
    shortDescription?: string;
    website?: string;
    downloadURL: string;
    nsfw?: boolean;
    rating?: number;
    lengthString?: string;
    status?: string;
    store: ModStore;
    highlighted: boolean;
    highlighted_patreon: boolean;
}
