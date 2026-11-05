import { ValidationError, number, object, string } from "yup";

const nameSchema = (label, maxLength) =>
  string()
    .trim()
    .min(1, `${label} is required`)
    .max(maxLength, `${label} must be at most ${maxLength} characters`)
    .required(`${label} is required`);

const emailSchema = string()
  .trim()
  .lowercase()
  .email("Email must be valid")
  .max(254, "Email must be at most 254 characters")
  .required("Email is required");

const passwordSchema = string()
  .required("Password is required")
  .test(
    "bcrypt-byte-limit",
    "Password must not exceed 72 UTF-8 bytes",
    (value) => value === undefined || Buffer.byteLength(value, "utf8") <= 72,
  );

const productPriceSchema = number()
  .typeError("Price must be a number")
  .test("finite", "Price must be a finite number", Number.isFinite)
  .min(0, "Price must be greater than or equal to 0")
  .max(1_000_000_000, "Price must not exceed 1000000000");

export const registerBodySchema = object({
  name: nameSchema("Name", 80),
  email: emailSchema,
  password: passwordSchema.min(8, "Password must be at least 8 characters"),
})
  .required("Request body is required")
  .typeError("Request body must be a JSON object");

export const loginBodySchema = object({
  email: emailSchema,
  password: passwordSchema,
})
  .required("Request body is required")
  .typeError("Request body must be a JSON object");

export const createProductBodySchema = object({
  name: nameSchema("Name", 120),
  description: string()
    .trim()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
  price: productPriceSchema.required("Price is required"),
})
  .required("Request body is required")
  .typeError("Request body must be a JSON object");

const optionalProductNameSchema = string()
  .trim()
  .min(1, "Name cannot be empty")
  .max(120, "Name must be at most 120 characters");

const optionalDescriptionSchema = string()
  .trim()
  .max(2000, "Description must be at most 2000 characters");

export const updateProductBodySchema = object({
  name: optionalProductNameSchema,
  description: optionalDescriptionSchema,
  price: productPriceSchema.optional(),
})
  .required("Request body is required")
  .typeError("Request body must be a JSON object")
  .test(
    "has-update",
    "At least one product field must be provided",
    (value) => Object.keys(value ?? {}).length > 0,
  );

export const productParamsSchema = object({
  id: string()
    .matches(/^[a-f\d]{24}$/i, "Product ID must be a valid MongoDB ObjectId")
    .required("Product ID is required"),
})
  .required("Route parameters are required")
  .typeError("Route parameters must be an object");

function validate(schema, source) {
  return async (req, res, next) => {
    try {
      req[source] = await schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });
      return next();
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        return next(error);
      }

      const errors = error.inner.length
        ? error.inner.map(({ path, message }) => ({ field: path, message }))
        : [{ message: error.message }];

      return res.status(400).json({
        message: "Request validation failed",
        errors,
      });
    }
  };
}

export const validateBody = (schema) => validate(schema, "body");
export const validateParams = (schema) => validate(schema, "params");
