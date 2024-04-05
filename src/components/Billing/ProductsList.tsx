import ProductDetails from "@/components/Billing/ProductDetails";
import ProductDescription from "@/components/Billing/ProductDescription";
import Label from "@/components/Billing/Label";
import { withInitialState } from "@/decorators/withInitialState";
import { withSession } from "@/decorators/withSession";

import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { inter } from "../../pages/_app";

interface productsData {
  id: number;
  name: string;
  description: string;
  price: number;
}

function ProductsList({
  recommended,
  recommendedColor,
  productsData,
  orgProductID,
  onButtonClick,
}: {
  recommended: string;
  recommendedColor?: string;
  productsData: productsData[];
  orgProductID: number;
  onButtonClick: (selectedPlan: string) => void;
}) {
  return (
    <div className="m-12 flex h-full flex-row  justify-center gap-4 ">
      <Product
        label={orgProductID === null ? "Your current plan " : undefined}
        labelColor="bg-gray-200"
        title="Free"
        description="Use GitLab for personal projects"
        price={0}
        productID={999}
      />
      {productsData?.map((product) => (
        <Product
          title={product.name}
          description={product.description}
          price={product.price}
          key={product.id}
          productID={product.id}
          orgProductID={orgProductID}
          recommended={recommended}
          recommendedColor={recommendedColor}
          onButtonClick={() => onButtonClick(product.name)}
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
  orgProductID,
  productID,
  recommended,
  recommendedColor,
  onButtonClick,
}: {
  label?: string;
  labelColor?: string;
  title: string;
  description: string;
  price: number;
  subLink?: string;
  buttonText?: string;
  children?: React.ReactNode;
  orgProductID?: number;
  productID?: number;
  recommended?: string;
  recommendedColor?: string;
  onButtonClick?: () => void;
}) {
  const active = orgProductID === productID;
  return (
    <div>
      <Label
        title={title}
        orgProductID={orgProductID}
        productID={productID}
        label={label}
        labelColor={labelColor}
        recommended={recommended}
        recommendedColor={recommendedColor}
      />

      <ProductDetails
        active={active}
        title={title}
        description={description}
        price={price}
        subLink={subLink}
        onButtonClick={onButtonClick}
        buttonText={buttonText}
      />

      <ProductDescription />

      <div>{children}</div>
    </div>
  );
}

export default ProductsList;
