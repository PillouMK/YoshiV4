import fs from "fs";

export class JsonStore<T> {
  constructor(
    private filePath: string,
    private defaultValue: T,
  ) {}

  load(): T {
    if (!fs.existsSync(this.filePath)) {
      this.save(this.defaultValue);
    }

    return JSON.parse(fs.readFileSync(this.filePath, "utf-8")) as T;
  }

  save(data: T): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }
}
