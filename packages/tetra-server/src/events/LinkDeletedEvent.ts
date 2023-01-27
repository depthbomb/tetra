export class LinkDeletedEvent {
    public readonly shortcode: string;

    public constructor(shortcode: string) {
        this.shortcode = shortcode;
    }
}
