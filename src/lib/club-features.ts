export type FeatureTree = {
  admin: {
    overview: boolean
    bookings: boolean
    courts: boolean
    blocks: boolean
    plans: boolean
    members: boolean
    vouchers: boolean
    settings: boolean
    export: boolean
    trainers: boolean
    courses: boolean
    finance: boolean
  }
  members: {
    contract_editor: boolean
    import: boolean
    invite: boolean
    documents: boolean
    payments: boolean
  }
  settings: {
    club: boolean
    ai: boolean
    cms: boolean
  }
}

export type FeatureLockTree = {
  admin: {
    overview: boolean
    bookings: boolean
    courts: boolean
    blocks: boolean
    plans: boolean
    members: boolean
    vouchers: boolean
    settings: boolean
    export: boolean
    trainers: boolean
    courses: boolean
    finance: boolean
  }
  members: {
    contract_editor: boolean
    import: boolean
    invite: boolean
    documents: boolean
    payments: boolean
  }
  settings: {
    club: boolean
    ai: boolean
    cms: boolean
  }
}

export const defaultFeatures: FeatureTree = {
  admin: {
    overview: true,
    bookings: true,
    courts: true,
    blocks: true,
    plans: true,
    members: true,
    vouchers: true,
    settings: true,
    export: true,
    trainers: true,
    courses: true,
    finance: true,
  },
  members: {
    contract_editor: true,
    import: true,
    invite: true,
    documents: true,
    payments: true,
  },
  settings: {
    club: true,
    ai: true,
    cms: true,
  },
}

export const defaultFeatureLocks: FeatureLockTree = {
  admin: {
    overview: false,
    bookings: false,
    courts: false,
    blocks: false,
    plans: false,
    members: false,
    vouchers: false,
    settings: false,
    export: false,
    trainers: false,
    courses: false,
    finance: false,
  },
  members: {
    contract_editor: false,
    import: false,
    invite: false,
    documents: false,
    payments: false,
  },
  settings: {
    club: false,
    ai: false,
    cms: false,
  },
}

export function mergeFeatures(stored: any): FeatureTree {
  const result: FeatureTree = JSON.parse(JSON.stringify(defaultFeatures))
  if (!stored || typeof stored !== "object") return result

  for (const section of Object.keys(defaultFeatures) as (keyof FeatureTree)[]) {
    const current = stored[section]
    if (!current || typeof current !== "object") continue
    for (const key of Object.keys(defaultFeatures[section]) as (keyof FeatureTree[typeof section])[]) {
      if (typeof current[key] === "boolean") {
        ;(result[section] as any)[key] = current[key]
      }
    }
  }
  return result
}

export function mergeFeatureLocks(stored: any): FeatureLockTree {
  const result: FeatureLockTree = JSON.parse(JSON.stringify(defaultFeatureLocks))
  if (!stored || typeof stored !== "object") return result

  for (const section of Object.keys(defaultFeatureLocks) as (keyof FeatureLockTree)[]) {
    const current = stored[section]
    if (!current || typeof current !== "object") continue
    for (const key of Object.keys(defaultFeatureLocks[section]) as (keyof FeatureLockTree[typeof section])[]) {
      if (typeof current[key] === "boolean") {
        ;(result[section] as any)[key] = current[key]
      }
    }
  }
  return result
}

export function isFeatureEnabled(features: FeatureTree, path: string[]) {
  let cursor: any = features
  for (const part of path) {
    if (!cursor || typeof cursor !== "object") return false
    cursor = cursor[part]
  }
  return cursor === true
}
