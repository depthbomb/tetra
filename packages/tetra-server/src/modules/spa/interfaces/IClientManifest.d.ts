export interface IClientManifest {
    [originalPath: string]: {
        file: string;
        src: string;
        isDynamicEntry?: boolean;
        imports?: string[];
        dynamicImports?: string[];
        css?: string[];
        assets?: string[];
    };
}
