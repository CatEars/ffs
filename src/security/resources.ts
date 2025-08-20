export type ResourceType = string;

export type Resource = `/${ResourceType}/${string}`;

export type AccessLevel = '/' | `/${ResourceType}/` | Resource;

const knownResourceTypes: Set<ResourceType> = new Set();

export class ResourceManager {
    private readonly resourceTypeName: ResourceType;
    private readonly _rootResourceName: AccessLevel;

    constructor(resourceTypeName: ResourceType) {
        knownResourceTypes.add(resourceTypeName);
        this.resourceTypeName = resourceTypeName;
        this._rootResourceName = `/${resourceTypeName}/`;
    }

    mayAccess(accessLevels: AccessLevel[], resource: Resource): boolean {
        return accessLevels.some((x) => resource.startsWith(x));
    }

    nameForResource(...resourceNames: string[]): Resource {
        const names = resourceNames.join('/');
        return `/${this.resourceTypeName}/${names}`;
    }

    rootResourceName() {
        return this._rootResourceName;
    }

    getFirstMatchingAccessLevel(accessLevels: AccessLevel[]) {
        return accessLevels.find((x) =>
            x === rootAccessLevel || x.startsWith(this._rootResourceName)
        );
    }

    stripResourceTypeName(accessLevel: AccessLevel) {
        if (accessLevel === rootAccessLevel) {
            return this._rootResourceName;
        } else {
            return accessLevel.substring(this._rootResourceName.length);
        }
    }
}

export function getKnownResourceTypes() {
    return knownResourceTypes;
}

export const rootAccessLevel: AccessLevel = '/';
