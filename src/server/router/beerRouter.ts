import { publicProcedure, createTRPCRouter } from "../init"
import { z } from "zod"
import { randomDataApi } from "../api/randomDataApi"

export const beerRouter = createTRPCRouter({
  getBeers: publicProcedure
    .input(
      z.object({
        size: z.number(),
      })
    )
    .query(async ({ input }) => {
      if (input.size > 100 || input.size < 2) throw new Error("Invalid size")

      let data = await randomDataApi.getBeers(input.size)

      return data
    }),
})
export default beerRouter
