import { LoginFlow, UiNodeGroupEnum } from "@ory/client";
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
  availableMethods: UiNodeGroupEnum[];
  onSubmit: (values: any) => Promise<void>;
}
const PasswordlessLogin = ({ flow, availableMethods, onSubmit }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">Passwordless Login</CardTitle>
        <CardDescription>
          Adopt passwordless login methods, as they are considered best practice
          and provide stronger security than traditional passwords.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availableMethods.includes("passkey") && (
          <Flow
            only="passkey"
            hideGlobalMessages
            onSubmit={onSubmit}
            flow={flow as LoginFlow}
          />
        )}
        {availableMethods.includes("oidc") &&
          availableMethods.includes("passkey") && (
            <div className="relative mt-6">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center"
              >
                <div className="w-full border-t border-muted-foreground/50" />
              </div>
              <div className="relative flex justify-center text-sm/6 font-medium">
                <span className="px-6 text-muted-foreground bg-card">
                  Or continue with
                </span>
              </div>
            </div>
          )}

        {availableMethods.includes("oidc") && (
          <>
            <div className="mt-6">
              <Flow
                className="flex flex-row flex-wrap gap-2 justify-center"
                only="oidc"
                hideGlobalMessages
                onSubmit={onSubmit}
                flow={flow as LoginFlow}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PasswordlessLogin;
