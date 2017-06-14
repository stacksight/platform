
angular.module('mean.stacks').directive('timeline',[function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="timeline"></div>',
        scope: {
        	data: '=',
            onChange: '&'
        },
        link: function($scope, element, attrs) {

            var margin = {top: 10, right: 25, bottom: 100, left: 40},
                margin2 = {top: 10, right: 10, bottom: 20, left: 40},
                width = $('.tab-content').width() - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom,
                height2 = 90 - margin2.top - margin2.bottom;


            var x = d3.time.scale().range([0, width]),
                x2 = d3.time.scale().range([0, width]),
                y = d3.scale.linear().range([height, 0]),
                y2 = d3.scale.linear().range([height2, 0]);

            var xAxis = d3.svg.axis().scale(x).orient("bottom"),
                xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
                yAxis = d3.svg.axis().scale(y).orient("left").ticks(5),
                yAxis2 = d3.svg.axis().scale(y2).orient("left").ticks(5);

            var brush = d3.svg.brush()
                .x(x2)
                .on("brushend", brushed);

            var area = d3.svg.area()
                .interpolate("linear")
                .x(function(d) { return x(d.key); })
                .y0(height)
                .y1(function(d) { return y(d.doc_count); });

            var area2 = d3.svg.area()
                .interpolate("linear")
                .x(function(d) { return x2(d.key); })
                .y0(height2)
                .y1(function(d) { return y2(d.doc_count); });

            var svg = d3.select(".timeline").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            svg.append("defs").append("clipPath")
                .attr("id", "clip")
              .append("rect")
                .attr("width", width)
                .attr("height", height);

            // var focus = svg.append("g")
            //     .attr("class", "focus")
            //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var context = svg.append("g")
                .attr("class", "context")
                .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

            // d3.csv("/apps/directives/colorful-border/views/sp500.csv", type, function(error, data) {
              x.domain(d3.extent($scope.data.map(function(d) { return d.key; })));
              y.domain([0, d3.max($scope.data.map(function(d) { return d.doc_count; }))]);
              x2.domain(x.domain());
              y2.domain(y.domain());

              // focus.append("path")
              //     .datum($scope.data)
              //     .attr("class", "area")
              //     .attr("d", area);

              // focus.append("g")
              //     .attr("class", "x axis")
              //     .attr("transform", "translate(0," + height + ")")
              //     .call(xAxis);

              // focus.append("g")
              //     .attr("class", "y axis")
              //     .call(yAxis);

              context.append("path")
                  .datum($scope.data)
                  .attr("class", "area")
                  .attr("d", area2);

              context.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height2 + ")")
                  .call(xAxis2);

               context.append("g")
                .attr("class", "y axis")
                .call(yAxis2);

              context.append("g")
                  .attr("class", "x brush")
                  .call(brush)
                .selectAll("rect")
                  .attr("y", -6)
                  .attr("height", height2 + 7);
            // });

            function brushed() {
                x.domain(brush.empty() ? x2.domain() : brush.extent());
                var range = brush.extent();

                var sd = range[0].setHours(0);
                sd = range[0].setMinutes(0);

                var ed = range[1].setHours(23);
                ed = range[1].setMinutes(59);

                var rangeStr = '';
                rangeStr = sd + ',' + ed;
                $scope.onChange({range: rangeStr});
              // focus.select(".area").attr("d", area);
              // focus.select(".x.axis").call(xAxis);
            }
        }
    };
}]);