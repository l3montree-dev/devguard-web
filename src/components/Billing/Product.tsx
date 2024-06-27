import { ProductsData } from "@/types/api/billing";

import { CheckIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/utils/common";
import { Button } from "../ui/button";

function Product({
  product,
  onButtonClick,
}: {
  product: ProductsData;
  onButtonClick: (selectedPlan: string) => void;
}) {
  return (
    <div
      key={product.id}
      className={classNames(
        " dark:text-white rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900",
        product.name === "Gold"
          ? "ring-2 ring-yellow-400"
          : "ring-1 ring-gray-200 dark:ring-gray-600",
      )}
    >
      <h3
        className={classNames(
          product.name === "Gold" ? "text-yellow-600" : "text-gray-900",
          "text-lg font-semibold leading-8 dark:text-white",
        )}
      >
        {product.name}
      </h3>
      <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-white">
        {product.description}
      </p>
      <p className="mt-6 flex items-baseline gap-x-1   ">
        <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {/* TODO: Add currency depending on the locale */}
          {new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(product.price)}
        </span>
        <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-white">
          /monthly
        </span>
      </p>
      {product.features && product.features.length > 0 && (
        <ul
          role="list"
          className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-white"
        >
          {product.features.map((feature) => (
            <li key={feature} className="flex gap-x-3">
              <CheckIcon
                className="h-6 w-5 flex-none text-gray-900 dark:text-gray-200"
                aria-hidden="true"
              />
              {feature}
            </li>
          ))}
        </ul>
      )}
      <div className={`mt-6 py-2 ${product.name === "Free" ? "hidden" : ""}`}>
        <Button
          onClick={() => onButtonClick(product.name)}
          variant={product.name === "Gold" ? "default" : "outline"}
        >
          {`Upgrade to ${product.name}`}
        </Button>
      </div>
    </div>
  );
}

export default Product;
