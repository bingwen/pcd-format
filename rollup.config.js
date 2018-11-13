import babel from 'rollup-plugin-babel';

export default {
    input: './src/pcd-format.js',
    plugins: [
        babel({
            exclude: 'node_modules/**',
            babelrc: false,
            presets: [['@babel/preset-env', { modules: false }]]
        })
    ],
    output: [
        {
            format: 'umd',
            file: 'build/pcd-format.js',
            name: 'pcd-format'
        },
        {
            format: 'es',
            file: 'build/pcd-format.module.js'
        }
    ]
};
