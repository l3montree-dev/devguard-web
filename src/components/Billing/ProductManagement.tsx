import Button from "@/components/common/Button";
import { config as appConfig } from "@/config";

function ProductManagement({
  orgName,
  orgProductName,
  orgID,
}: {
  orgName: string;
  orgProductName: string;
  orgID: string;
}) {
  return (
    <div className="flex  flex-col  items-center">
      <div className="m-8 text-center dark:text-white">
        <h1>
          {orgName} is currently using the {orgProductName}
        </h1>
      </div>
      <div>
        <Button
          href={
            appConfig.flawFixApiUrl + `/billing/create-portal-session/${orgID}`
          }
          variant="solid"
          intent="primary"
        >
          Manage subscription
        </Button>
      </div>
    </div>
  );
}

export default ProductManagement;
