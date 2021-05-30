export interface AccountDTO {
    id: string;
    name: string;
    label: string;
    iconURL?: string;
    redirectURIs: string[];
    defaultRedirectURI?: string;
}
