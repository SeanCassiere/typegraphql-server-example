module.exports = {
	preset: "ts-jest",
	testTimeout: 12000,
	testEnvironment: "node",
	testPathIgnorePatterns: ["dist"],
	moduleNameMapper: {
		"#root/(.*)": "<rootDir>/src/$1",
	},
};
