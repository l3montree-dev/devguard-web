import ProductDetails from "@/pages/Billing/ProductDetails";
import ProductDescription from "@/pages/Billing/ProductDescription";
import Label from "@/pages/Billing/Label";
import { withInitialState } from "@/decorators/withInitialState";
import { withSession } from "@/decorators/withSession";

import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { inter } from "../_app";

interface productsData {
  id: number;
  name: string;
  description: string;
  price: number;
}

function ProductsList({ productsData }: { productsData: productsData[] }) {
  return (
    <div className="m-12 flex h-full flex-row justify-center gap-4 ">
      <Product
        label="Your current plan"
        labelColor="bg-gray-200"
        title="Free"
        description="Use GitLab for personal projects"
        price={0}
      />
      {productsData?.map((product) => (
        <Product
          title={product.name}
          description={product.description}
          price={product.price}
          key={product.id}
        />
      ))}
    </div>
  );
}

function Product({
  label,
  labelColor,
  title,
  description,
  price,
  subLink,
  buttonText,
  children,
}: {
  label?: string;
  labelColor?: string;
  title: string;
  description: string;
  price: number;
  subLink?: string;
  buttonText?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-1/3  basis-1/3 flex-col ">
      <Label label={label} labelColor={labelColor} />

      <ProductDetails
        title={title}
        description={description}
        price={price}
        subLink={subLink}
        buttonText={buttonText}
      />

      <ProductDescription />

      <div>{children}</div>
    </div>
  );
}

export default ProductsList;
