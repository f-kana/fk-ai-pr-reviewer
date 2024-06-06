abstract class TestDataLoader {
  protected static filePath: string // Rel path to the file from this file
  public static build(): any {
    if (!this.filePath) {
      throw new Error('filePath is not defined')
    }
    return require(this.filePath);
  }
}

export class GhTestDataLoaderForIssue5 extends TestDataLoader {
  static filePath = './testdata/gh-issue5.json'
}

export class GhTestDataLoaderForPr6ForIssue5 extends TestDataLoader {
  static filePath = './testdata/gh-pr6-for-issue5.json'
}
