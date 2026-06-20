import { z } from 'zod';

const weightSchema = z.object({
  imperial: z.string().optional().default(''),
  metric: z.string().optional().default('')
});

export const upstreamBreedSchema = z.object({
  id: z.string(),
  name: z.string(),
  temperament: z.string().optional(),
  origin: z.string().optional(),
  description: z.string().optional(),
  life_span: z.string().optional(),
  wikipedia_url: z.string().url().optional(),
  weight: weightSchema.optional(),
  affection_level: z.number().optional(),
  child_friendly: z.number().optional(),
  dog_friendly: z.number().optional(),
  energy_level: z.number().optional(),
  grooming: z.number().optional(),
  health_issues: z.number().optional(),
  intelligence: z.number().optional(),
  shedding_level: z.number().optional(),
  social_needs: z.number().optional(),
  stranger_friendly: z.number().optional(),
  vocalisation: z.number().optional(),
  reference_image_id: z.string().optional()
});

export const upstreamImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  width: z.number().optional(),
  height: z.number().optional()
});

export type UpstreamBreed = z.infer<typeof upstreamBreedSchema>;
export type UpstreamImage = z.infer<typeof upstreamImageSchema>;

export function normalizeBreed(breed: UpstreamBreed) {
  return {
    id: breed.id,
    name: breed.name,
    temperament: splitList(breed.temperament),
    origin: breed.origin ?? '',
    description: breed.description ?? '',
    lifeSpan: breed.life_span ?? '',
    wikipediaUrl: breed.wikipedia_url ?? null,
    referenceImageId: breed.reference_image_id ?? null,
    weight: breed.weight ?? { imperial: '', metric: '' },
    ratings: {
      affection: breed.affection_level ?? null,
      childFriendly: breed.child_friendly ?? null,
      dogFriendly: breed.dog_friendly ?? null,
      energy: breed.energy_level ?? null,
      grooming: breed.grooming ?? null,
      healthIssues: breed.health_issues ?? null,
      intelligence: breed.intelligence ?? null,
      shedding: breed.shedding_level ?? null,
      socialNeeds: breed.social_needs ?? null,
      strangerFriendly: breed.stranger_friendly ?? null,
      vocalisation: breed.vocalisation ?? null
    }
  };
}

export function normalizeImage(image: UpstreamImage) {
  return {
    id: image.id,
    url: image.url,
    width: image.width ?? null,
    height: image.height ?? null
  };
}

function splitList(value: string | undefined) {
  return value?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];
}
