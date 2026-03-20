export class FetchException<T = any> extends Error {
  public status: number;
  public body: T | null;

  constructor(message: string, status: number, body: T | null = null) {
    super(message);
    this.name = "FetchException";
    this.status = status;
    this.body = body;
  }
}
