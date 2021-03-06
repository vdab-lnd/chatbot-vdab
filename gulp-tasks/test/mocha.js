import gulp from 'gulp';
import mocha from 'gulp-mocha';

export const testunit = 'test:unit';

function handleError(err){
    console.log(err.toString());
    this.emit('end');
}

gulp.task(testunit, () => {
    return gulp.src('src/**/*_test.js', {read: false})
        .pipe(mocha({
            compilers: 'js:babel-core/register',
            useColors: false,
            reporter: 'mocha-jenkins-reporter',
            reporterOptions: {
                junit_report_path: './test-reports/mocha/test-results_mocha.xml'
            }
        }))
        .on('error', handleError);
});