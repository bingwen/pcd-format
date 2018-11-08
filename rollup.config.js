export default {
    input: 'src/index.js',
    plugins: [
    ],
    output: [
        {
            format: 'umd',
            name: 'THREE',
            file: 'build/pcd-format.js',
            indent: '\t'
        },
        {
            format: 'es',
            file: 'build/pcd-format.module.js',
            indent: '\t'
        }
    ]
};