import { getDirections } from "../services/routes.service.js";
import { routeSchema } from "../validation/schemas.js";

export async function directions(req: any, res: any) {
  const input = routeSchema.parse(req.body);

  const route = await getDirections(
    input.origin,
    input.destination
  );

  res.json({ route });
}
