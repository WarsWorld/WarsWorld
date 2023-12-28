import type { MatchWrapper } from "shared/wrappers/match";

class PageMatchIndex {
  /**
   * a list of matches sorted by createMatchAndStore call order
   * (should always be from oldest created to newest)
   */
  private list: MatchWrapper[] = [];

  getPage(pageNumber: number) {
    console.log("This List");
    console.log(this);
    console.log(this.list);
    //this list is a list of matches
    const start = pageNumber * 50;
    return this.list.slice(start, start + 50);
  }

  addMatch(match: MatchWrapper) {
    this.list.push(match);
  }

  removeMatch(match: MatchWrapper) {
    const listIndex = this.list.findIndex((m) => m.id === match.id);

    if (listIndex === -1) {
      throw new Error(
        `Tried to remove match ${match.id} from idIndex but wasn't found`
      );
    }

    this.list.splice(listIndex, 1);
  }
}

export const pageMatchIndex = new PageMatchIndex();
