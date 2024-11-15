import { createClient } from "redis"

export default async () => {
  const client = await createClient({
    url: `redis://default:redispw@redis:6379`,
  })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect()
  return client
}
