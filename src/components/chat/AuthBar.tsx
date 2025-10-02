import { useContext } from "react";
import AppContext from "@/lib/AppContext";
import useAuth, { AuthState } from "@/hooks/useAuth";
import { NavLink } from "react-router";

import { Button } from "@ui/button";

export default function AuthBar({
	onLoginClick,
	onSignupClick,
	isLoginPending,
	isSignupPending
}: { onLoginClick: () => void, onSignupClick: () => void, isLoginPending: boolean, isSignupPending: boolean }) {
	const { userData, isConnected, attemptLogout } = useContext(AppContext);

	const isLoggedIn = useAuth();
    const isOperator = useAuth(AuthState.Operator);

	const handleLogout = () => {
		attemptLogout();
	}

	return (
		<div className="flex items-center justify-between gap-2 text-sm border shadow-sm rounded-lg h-12 px-2">
			{ isConnected
				? (
					isLoggedIn
						? (
							<>
								<div className="flex gap-2 items-center grow-1 shrink-1">
                                    <p className="px-2">
                                        Logged in as: <strong>{ userData?.username }</strong>
                                    </p>
                                    { isOperator && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
											asChild
                                        >
                                            <NavLink
												to="/mod"
											>
												mod tools
											</NavLink>
                                        </Button>
                                    )}
                                </div>
								<div>
									<Button
										size="sm"
										onClick={handleLogout}
									>
										Log out
									</Button>
								</div>
							</>
						): (
							<>
								<p className="px-2">
									You're not logged in.
								</p>

								<div className="flex items-center gap-2">
									<Button
										onClick={onLoginClick}
										size="sm"
										disabled={isLoginPending}
									>
										Log In
									</Button>

									<Button
										onClick={onSignupClick}
										size="sm"
										disabled={isSignupPending}
									>
										Sign up
									</Button>
								</div>
							</>
						)
				): (
					<>
						<p className="px-2">
							No server connection.
						</p>
					</>
				)}
		</div>
	)
}