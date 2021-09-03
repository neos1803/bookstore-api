require("dotenv").config()
import { Controller, Example, Get, Query, Route } from "tsoa";
import * as puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { ResponseHelper } from "../../../utils/response.helper";

const base_url = {
  tokopedia: "https://www.tokopedia.com/search?navsource=home"
}

@Route('/v1/manga')
export class MangaController extends Controller {

  @Example<any>({
    "data": {
      "data": {
        "name": {
          "english": "Attack on Titan",
          "japanese": "進撃の巨人"
        },
        "rating": "8.58",
        "content": {
          "volumes": "34",
          "chapters": "141",
          "status": "Finished"
        }
      },
      "high": [
        {
          "link": "https://www.tokopedia.com/kemal-store2/ready-ya-kak-komik-attack-on-titan-set-1-28?refined=true&whid=0",
          "price": "Rp3.465.000"
        },
        {
          "link": "https://www.tokopedia.com/kittystore12/terbaik-komik-attack-on-titan-full-set-1-30?refined=true&whid=0",
          "price": "Rp3.443.000"
        },
      ],
      "low": [
        {
          "link": "https://www.tokopedia.com/promediacell/sewa-komik-attack-on-titan-25?refined=true&whid=0",
          "price": "Rp5.000"
        },
        {
          "link": "https://www.tokopedia.com/vvibupoistore/komik-segel-baru-bebas-milih-seraph-of-the-end-attack-on-titan-hanako?refined=true&whid=0",
          "price": "Rp5.000"
        },
      ],
      "cost": {
        "highest": "Rp3.465.000",
        "lowest": "Rp5.000"
      },
      "totalProducts": 2966
    },
    "success": true
  })
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
      
      let response = {
        data: {
          name: {
            english: "",
            japanese: ""
          },
          rating: "",
          content: {
            volumes: "",
            chapters: "",
            status: ""
          }
        },
        high: [] as Array<{
          link: string,
          price: string
        }>,
        low: [] as Array<{
          link: string,
          price: string
        }>,
        cost: {
          highest: "",
          lowest: ""
        },
        totalProducts: 0
      };

      await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36");
      await page.goto(`${base_url.tokopedia}&nuq=${name.replace(/\s/g, '%20')}&ob=4&rf=true&sc=3309&source=universe&st=product&q=${name.replace(/\s/g, '%20')}`, {
        waitUntil: 'domcontentloaded'
      });

      await page.waitForTimeout(1000);

      const contentHigh = await page.content();
      const $High = cheerio.load(contentHigh);

      response.totalProducts = $High(".css-rjanld > .css-w01oz8 > .css-8j9pkz").length != 0 ? Number($High(".css-rjanld > .css-w01oz8 > .css-8j9pkz").text().trim().split(" ")[7].replace(".", "")) : 0;

      const productHigh = $High(".css-12sieg3");
      productHigh.each((i, e) => {
        const link = $High(e)
          .find(".css-1ehqh5q > a")
          .attr("href")
        
        if (!(link?.includes("ta.tokopedia.com/promo"))) {
          if ($High(e).find(".css-1ehqh5q > .css-14x6rma").length == 0) {
            const price = $High(e).find(".css-33bcxk > a > .css-rhd610").text().trim();
            if (link && price !== "") {
              response.high.push({
                link: link as string,
                price
              })
            }
          }
        }
      });

      await page.goto(`${base_url.tokopedia}&nuq=${name.replace(/\s/g, '%20')}&ob=3&rf=true&sc=3309&source=universe&st=product&q=${name.replace(/\s/g, '%20')}`, {
        waitUntil: 'domcontentloaded'
      });

      const contentLow = await page.content();
      const $Low = cheerio.load(contentLow);
      
      const productLow = await $Low(".css-12sieg3");
      productLow.each((_, e) => {
        const link = $Low(e)
          .find(".css-1ehqh5q > a")
          .attr("href")
        
        if (!(link?.includes("ta.tokopedia.com/promo"))) {
          if ($Low(e).find(".css-1ehqh5q > .css-14x6rma").length == 0) {
            const price = $Low(e).find(".css-33bcxk > a > .css-rhd610").text().trim();
            if (link && price !== "") {
              response.low.push({
                link: link as string,
                price: $Low(e).find(".css-33bcxk > a > .css-rhd610").text().trim()
              })
            }
          }
        }
      });

      response.cost.highest = response.high[0].price;
      response.cost.lowest = response.low[0].price;

      await page.goto(`https://myanimelist.net/manga.php?q=${name.replace(/\s/g, "%20")}&cat=manga`, {
        waitUntil: 'domcontentloaded'
      });

      const mal_content = await page.content();
      const $MAL = cheerio.load(mal_content);

      const content = await $MAL("div[class='js-categories-seasonal js-block-list list'] > table > tbody");
      const manga_link: string = $MAL(content[0]).find("tr > td[class='borderClass bgColor0'] > a").attr("href") as string;

      await page.goto(manga_link, {
        waitUntil: 'domcontentloaded'
      });

      const manga_content = await page.content();
      const $MANGA = cheerio.load(manga_content);
      
      const side_bar = $MANGA("div[id='content'] > table > tbody > tr > td[class='borderClass']");
      $MANGA(side_bar)
        .find(".spaceit_pad")
        .each((_, e) => {
          const text = $MANGA(e).text()
          if (text.includes("English")) {
            response.data.name.english = text.replace("English: ", "")
          }
          if (text.includes("Japanese:")) {
            response.data.name.japanese = text.replace("Japanese: ", "")
          }
        });

      $MANGA(side_bar)
        .find("div")
        .each((_, e) => {
          const text = $MANGA(e).text()
          if (text.includes("Chapters")) response.data.content.chapters = text.replace("Chapters: ", "").replace("\n", "")
        })

      $MANGA(side_bar)
        .find(".spaceit")
        .each((_, e) => {
          const text = $MANGA(e).text()
          if (text.includes("Volumes")) response.data.content.volumes = text.replace("Volumes: ", "").replace("\n", "")
          if (text.includes("Status")) response.data.content.status = text.replace("Status: ", "")
        });
      
      response.data.rating = $MANGA(side_bar)
        .find("div[class='po-r js-statistics-info di-i'] > span > span[itemprop='ratingValue']")
        .text();

      await page.close();
      
      this.setStatus(200);

      return new ResponseHelper<any>(response, true);
    } catch (error) {
      return new ResponseHelper<any>(error, false);
    }
  }

}