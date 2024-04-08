import { ProductsData } from "@/types/api/billing";
import Button from "@/components/common/Button";
import { CheckIcon } from "@heroicons/react/20/solid";

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
      className={`
                    ${
                      product.name === "Gold"
                        ? "ring-2 ring-yellow-400"
                        : "ring-1 ring-gray-200"
                    }
                    rounded-3xl p-8
                    dark:text-white 
                `}
    >
      <h3
        className={`
                  product.name === "Gold"
                    ? "text-yellow-600"
                    : "text-gray-900",
                  "text-lg leading-8", "dark:text-white
                  ", )
                font-semibold`}
      >
        {product.name}
      </h3>
      <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-white">
        {product.description}
      </p>
      <p className="mt-6 flex items-baseline gap-x-1   ">
        <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          €{product.price / 100}
        </span>
        <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-white">
          /monthly
        </span>
      </p>

      <div className={`mt-6 py-2 ${product.name === "Free" ? "hidden" : ""}`}>
        <Button
          onClick={() => onButtonClick(product.name)}
          variant={product.name === "Gold" ? "solid" : "outline"}
          intent={product.name === "Gold" ? "primary" : "primary"}
          className={product.name !== "" ? "" : ""}
        >
          {`upgrade to ${product.name}`}
        </Button>
      </div>
      {product.features && product.features.length > 0 && (
        <ul
          role="list"
          className="mt-8 space-y-3 text-sm leading-6 text-gray-600  dark:text-white 
                "
        >
          {product.features.map((feature) => (
            <li key={feature} className="flex gap-x-3">
              <CheckIcon
                className="h-6 w-5 flex-none text-gray-200"
                aria-hidden="true"
              />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Product;
