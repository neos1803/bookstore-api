import { Controller, Get, Route } from "tsoa";

@Route('/v1/healthcheck')
export class HealthCheckController extends Controller {

  @Get('/check')
  public checkHealth(): String {
    console.log("Sehat")
    return "Sehat";
  }

}