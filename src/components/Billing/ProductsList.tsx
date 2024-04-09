import Button from "@/components/common/Button";
import { ProductsData } from "@/types/api/billing";
import Title from "./Title";
import Product from "./Product";

function Products({
  productsDataWithFreeSorted,
  onButtonClick,
}: {
  productsDataWithFreeSorted: ProductsData[];
  onButtonClick: (selectedPlan: string) => void;
}) {
  return (
    <div className="mx-auto max-w-7xl bg-white  px-6 py-24 dark:bg-slate-950 sm:py-32 lg:px-8">
      <Title />
      <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 dark:bg-slate-950 dark:text-white md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4 ">
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
