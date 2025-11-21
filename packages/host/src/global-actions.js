import React from "react";
export const GlobalActionsContext = React.createContext(undefined);
export function GlobalActionsProvider(props) {
    const { contextName, children, actions } = props;
    const existingActions = useGlobalActions();
    const namespacedActions = React.useMemo(() => Object.fromEntries(Object.entries(actions).map(([key, val]) => [
        `${contextName}.${key}`,
        val,
    ])), [contextName, actions]);
    return (React.createElement(GlobalActionsContext.Provider, { value: {
            ...existingActions,
            ...namespacedActions,
        } }, children));
}
export function useGlobalActions() {
    var _a;
    return (_a = React.useContext(GlobalActionsContext)) !== null && _a !== void 0 ? _a : {};
}
