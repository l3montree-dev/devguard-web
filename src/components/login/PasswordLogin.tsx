import { LoginFlow } from "@ory/client";
import Carriage from "../common/Carriage";
import { Flow } from "../kratos/Flow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Props {
  flow?: LoginFlow;
  onSubmit: (values: any) => Promise<void>;
}
const PasswordLogin = ({ flow, onSubmit }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">Legacy Password Login</CardTitle>
        <CardDescription>
          Passwords are insecure by design. We recommend using a passwordless
          authentication methods.{" "}
          <div className="mr-2 inline-block w-8">
            <Carriage />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Flow
          only="password"
          hideGlobalMessages
          onSubmit={onSubmit}
          flow={flow as LoginFlow}
        />
      </CardContent>
    </Card>
  );
};

export default PasswordLogin;
