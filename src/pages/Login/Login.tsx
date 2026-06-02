import { useState, type SubmitEvent } from "react";
import styles from "./Login.module.scss";
import { auth } from "../../services/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export const Login = () => {
    const [emailLogin, setEmailLogin] = useState("");
    const [senhaLogin, setSenhaLogin] = useState("");
    const [mostrarSenhaLogin, setMostrarSenhaLogin] = useState(false);

    const [emailRegister, setEmailRegister] = useState("");
    const [senhaRegister, setSenhaRegister] = useState("");
    const [mostrarSenhaRegister, setMostrarSenhaRegister] = useState(false);

    //SyntheticEvent ou SyntheticEvent<HTMLFormElement> eh generico para todos os eventos, funciona com submit, mas o submit tem seu tipo proprio, o SubmitEvent ou SubmitEvent<HTMLFormElement>
    const handleLoginSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const credenciais = await signInWithEmailAndPassword(
                auth,
                emailLogin,
                senhaLogin,
            );
            console.log("Bem-vindo:", credenciais.user.email);
        } catch (erro) {
            console.error("Email ou palavra-passe incorretos", erro);
        }
    };

    const handleRegisterSubmit = async (
        event: SubmitEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        try {
            console.log(
                "A tentar criar utilizador no Firebase...",
                emailRegister,
            );

            const credenciais = await createUserWithEmailAndPassword(
                auth,
                emailRegister,
                senhaRegister,
            );

            console.log("Conta criada com sucesso!", credenciais.user);
            alert("Conta criada com sucesso! Já pode fazer login.");

            setEmailRegister("");
            setSenhaRegister("");
        } catch (erro: any) {
            console.error("Erro ao criar conta no Firebase:", erro);

            if (erro.code === "auth/email-already-in-use") {
                alert("Este e-mail já está a ser utilizado por outra conta.");
            } else if (erro.code === "auth/weak-password") {
                alert(
                    "A senha é muito fraca. Deve ter pelo menos 6 caracteres.",
                );
            } else if (erro.code === "auth/invalid-email") {
                alert("O formato do e-mail é inválido.");
            } else {
                alert("Ocorreu um erro ao criar a conta. Tente novamente.");
            }
        }
    };

    return (
        <div className={styles["container-login-register"]}>
            <div className={styles.login}>
                <h2>Login</h2>
                <form className={styles.form} onSubmit={handleLoginSubmit}>
                    <input
                        type="email"
                        placeholder="O seu E-mail"
                        required
                        value={emailLogin}
                        onChange={(e) => setEmailLogin(e.target.value)}
                    />
                    <div className={styles["password-container"]}>
                        <input
                            type={mostrarSenhaLogin ? "text" : "password"}
                            placeholder="A sua Senha"
                            required
                            value={senhaLogin}
                            onChange={(e) => setSenhaLogin(e.target.value)}
                        />
                        <button
                            type="button"
                            className={styles["toggle-password"]}
                            onClick={() =>
                                setMostrarSenhaLogin(!mostrarSenhaLogin)
                            }
                        >
                            {mostrarSenhaLogin ? (
                                <EyeSlash size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>
                    <input type="submit" value="Entrar" />
                </form>
            </div>

            <div className={styles.register}>
                <h2>Criar Conta</h2>
                <form className={styles.form} onSubmit={handleRegisterSubmit}>
                    <input
                        type="email"
                        placeholder="Novo E-mail"
                        required
                        value={emailRegister}
                        onChange={(e) => setEmailRegister(e.target.value)}
                    />
                    <div className={styles["password-container"]}>
                        <input
                            type={mostrarSenhaRegister ? "text" : "password"}
                            placeholder="Nova Senha"
                            required
                            value={senhaRegister}
                            onChange={(e) => setSenhaRegister(e.target.value)}
                        />
                        <button
                            type="button"
                            className={styles["toggle-password"]}
                            onClick={() =>
                                setMostrarSenhaRegister(!mostrarSenhaRegister)
                            }
                        >
                            {mostrarSenhaRegister ? (
                                <EyeSlash size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>
                    <input type="submit" value="Registrar" />
                </form>
            </div>
        </div>
    );
};
