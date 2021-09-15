import dotenv from "dotenv";

dotenv.config();

const variablesToCheck = ["NODE_ENV", "PORT", "DATABASE_URL", "SESSION_SECRET"] as const;

type EnvTypes = typeof variablesToCheck[number];
type ReturnType = { [key in EnvTypes]?: any };

function checkEnvAvailable(name: EnvTypes) {
	if (process.env[name]) {
		return process.env[name];
	}
	throw new Error(`Env Variable process.env.${name} not defined`);
}

function getEnvVariables() {
	let returnVariables: ReturnType = {};

	variablesToCheck.forEach((envVar) => {
		returnVariables = { ...returnVariables, [envVar]: checkEnvAvailable(envVar) };
	});
	return returnVariables;
}

export const environmentVariables = getEnvVariables();

export default environmentVariables;
