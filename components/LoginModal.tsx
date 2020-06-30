import React from "react";
import {
  Input,
  ModalWithButtons,
  // @ts-ignore
} from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import classnames from "classnames";

const LoginModal: React.FC<LoginModalProps> = (props) => {
  const {
    isPending,
    isLoggedIn,
    attemptLogin,
    attemptLogout,
    authError,
  } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <ModalWithButtons
      isOpen={props.isOpen}
      onCloseModal={props.onCloseModal}
      onSubmit={() => {
        if (!isLoggedIn) {
          attemptLogin(email, password).then((success: boolean) => {
            setPassword("");
            if (success) {
              setEmail("");
              props.onCloseModal();
            }
          });
        } else {
          attemptLogout().then(() => {
            props.onCloseModal();
          });
        }
      }}
      color={props.color}
      primaryText={isLoggedIn ? "Logout" : "Login"}
      primaryDisabled={
        !isLoggedIn && (email.trim().length == 0 || password.length == 0)
      }
      secondaryText={"Cancel"}
      shouldCloseOnOverlayClick={true}
    >
      <>
        {!isLoggedIn && (
          <div className="login">
            <div className={classnames("inputs", { pending: isPending })}>
              <div>
                <Input
                  id={"email"}
                  value={email}
                  label={"Email"}
                  onTextChange={(text: string) => setEmail(text)}
                  color={props.color}
                />
              </div>
              <div>
                <Input
                  id={"password"}
                  value={password}
                  label={"Password"}
                  onTextChange={(text: string) => setPassword(text)}
                  password
                  color={props.color}
                />
              </div>
              <div className={classnames("error", { hidden: !authError })}>
                {authError || "Hidden error field!"}
              </div>
            </div>
          </div>
        )}
        {isLoggedIn && (
          <div className="logout">
            <div>Pull the trigger, Piglet. </div>
          </div>
        )}
      </>
      <style jsx>{`
        .inputs {
          margin: 0 auto;
          margin-bottom: 15px;
          width: 100%;
        }
        .inputs > div:first-child {
          margin-bottom: 5px;
        }
        .buttons {
          display: flex;
          justify-content: flex-end;
        }
        .buttons > div {
          margin-left: 15px;
        }
        .error {
          color: red;
          margin-top: 10px;
          margin-left: 20px;
          font-size: small;
        }
        .error.hidden {
          visibility: hidden;
        }
      `}</style>
    </ModalWithButtons>
  );
};

export interface LoginModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
  color?: string;
}

export default LoginModal;
