import { Link } from '~database/models/Link';

export async function getTotalLinks(): Promise<number> {
	return Link.count()
}
