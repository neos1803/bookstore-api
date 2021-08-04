export class ResponseHelper<T> {
  success: boolean;
  data: T;

  constructor(data: T, success: boolean) {
    this.data = data;
    this.success = success;
  }
}
