import { Route, RouterType } from 'itty-router';
export interface RouterExtended extends RouterType {
	lock: Route;
	unlock: Route;
}
