import 'dotenv/config'

interface ENV {
  NODE_ENV: string | undefined
  DATABASE_URL: string | undefined
}

type WithoutNullableKeys<T> = {
  [Key in keyof T]-?: WithoutNullableKeys<NonNullable<T[Key]>>
}

type Config = WithoutNullableKeys<ENV>

const getConfig = (): ENV => ({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
})

const getSanitizedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`)
    }
  }
  return config as Config
}

export const config = getSanitizedConfig(getConfig())
