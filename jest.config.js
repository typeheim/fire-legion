// jest.config.ts

module.exports = {
    'clearMocks': true,
    'automock': false,
    preset: 'ts-jest',
    'transform': {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    'modulePathIgnorePatterns': [
        '<rootDir>/specs/$1',
    ],
    'setupFiles': [
        './packages/orm-on-fire/specs/spek-kit/bootstrap.ts',
    ],
    'testRegex': '.spec.ts$',
    'moduleFileExtensions': [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
    'collectCoverage': true,
    'rootDir': './',
    'moduleNameMapper': {
        '@typeheim/fire-auth': '<rootDir>/packages/fire-auth',
        '@typeheim/orm-on-fire': '<rootDir>/packages/orm-on-fire',
    },
    'coverageDirectory': '../coverage',
    'testEnvironment': 'node',
    'globals': {
        'ts-jest': {
            'tsconfig': '<rootDir>/tsconfig.json',
        },
    },
}
