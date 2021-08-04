require("dotenv").config()
import { Controller, Get, Query, Route } from "tsoa";
import * as puppeteer from "puppeteer";
import * as cheerio from "cheerio";

@Route('/v1/manga')
export class MangaController extends Controller {

  @Get('/tokopedia')
  public async scrapTokopedia(
    @Query('name') name: string,
  ): Promise<any> {
    try {
      const browser =  await puppeteer.launch({
        headless: true,
      });
  
      const page = await browser.newPage();
      page.setViewport({
        width: 1366,
        height: 768
      });

      let links = {
        high: [] as Array<String>,
        low: [] as Array<String>
      };

      let price = {
        high: [] as Array<String>,
        low: [] as Array<String>
      }

      console.log(`${process.env.BASE_URL_TOKOPEDIA}&nuq=${name.replace(/\s/g, '%20')}&ob=4&rf=true&sc=3309&source=universe&st=product&q=${name.replace(/\s/g, '%20')}`)
      await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36");
      await page.goto(`${process.env.BASE_URL_TOKOPEDIA}&nuq=${name.replace(/\s/g, '%20')}&ob=4&rf=true&sc=3309&source=universe&st=product&q=${name.replace(/\s/g, '%20')}`, {
        waitUntil: 'domcontentloaded'
      });

      // await page.evaluate('window.scrollTo(0,99999)');

      await page.waitForTimeout(1000);

      const contentHigh = await page.content();
      const $High = cheerio.load(contentHigh);

      const totalProducts = $High(".css-rjanld > .css-w01oz8 > .css-8j9pkz").length != 0 ? $High(".css-rjanld > .css-w01oz8 > .css-8j9pkz").text().trim().split(" ")[7].replace(".", "") : 0;

      const productHigh = $High(".css-12sieg3");
      productHigh.each((_, e) => {
        const link = $High(e)
          .find(".css-1ehqh5q > a")
          .attr("href")
        
        if (!(link?.includes("ta.tokopedia.com/promo"))) links.high.push(link as string)

        if ($High(e).find(".css-1ehqh5q > .css-14x6rma").length == 0) {
          price.high.push(
            $High(e).find(".css-7fmtuv > a > .css-rhd610").text().trim()
          );
        }
      });

      await page.goto(`${process.env.BASE_URL_TOKOPEDIA}&nuq=${name.replace(/\s/g, '%20')}&ob=3&rf=true&sc=3309&source=universe&st=product&q=${name.replace(/\s/g, '%20')}`, {
        waitUntil: 'domcontentloaded'
      });

      const contentLow = await page.content();
      const $Low = cheerio.load(contentLow);
      
      const productLow = await $Low(".css-12sieg3");
      productLow.each((_, e) => {
        const link = $Low(e)
          .find(".css-1ehqh5q > a")
          .attr("href")
        
        if (!(link?.includes("ta.tokopedia.com/promo"))) links.low.push(link as string)

        if ($Low(e).find(".css-1ehqh5q > .css-14x6rma").length == 0) {
          price.low.push(
            $Low(e).find(".css-7fmtuv > a > .css-rhd610").text().trim()
          );
        }
      });

      await page.goto(`https://myanimelist.net/manga.php?q=${name.replace(/\s/g, "%20")}&cat=manga`, {
        waitUntil: 'domcontentloaded'
      });

      // const contentMAL = await page.content();
      // const $MAL = cheerio.load(contentMAL);



      return "Oke"
    } catch (error) {
      console.log(error)
    }
  }

}