const fs = require('fs');

let htmlFile = 'html-frontend/admin/results/results.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

const tableHTML = `
            <div class="panel">
                <div class="panel-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0" id="resultsTable">
                            <thead class="table-light">
                                <tr>
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Education</th>
                                    <th>Top Career Match</th>
                                    <th>Match %</th>
                                    <th>Completed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td colspan="6" class="text-center py-4">Loading results...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
`;

htmlContent = htmlContent.replace(/<div class="panel">[\s\S]*?<\/div>\s*<\/div>/, tableHTML);

fs.writeFileSync(htmlFile, htmlContent);
console.log("Updated results.html");
