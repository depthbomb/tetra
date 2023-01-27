export class LinkCreatedEvent {
    public readonly shortcode: string;

    public constructor(shortcode: string) {
        this.shortcode = shortcode;
    }
}
