import Button from "@/components/common/Button";
import { ProductsData } from "@/types/api/billing";
import Product from "./Product";

function Products({
  productsDataWithFreeSorted,
  onButtonClick,
}: {
  productsDataWithFreeSorted: ProductsData[];
  onButtonClick: (selectedPlan: string) => void;
}) {
  return (
    <div className="mx-auto py-4 dark:bg-slate-950 sm:py-4">
      <div>
        <div className="mx-auto max-w-4xl text-center">
          <p className="mt-2 font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl ">
            Pricing plans for teams of&nbsp;all&nbsp;sizes
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white ">
          Choose an affordable plan that’s packed with the best features for
          engaging your audience, creating customer loyalty, and driving sales.
        </p>
      </div>
      <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 dark:text-white md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4 ">
        {productsDataWithFreeSorted.map((product) => (
          <Product
            key={product.id}
            product={product}
            onButtonClick={onButtonClick}
          />
        ))}
      </div>
    </div>
  );
}

export default Products;
