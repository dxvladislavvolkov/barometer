import { discover, IBlock } from "./block-discoverer";

describe("js discoverer", () => {

    it("discovers function", () => {
        const text = `
        function targetFunc() {
            const x = 123;
            // some code goes here
        }`;

        const actual = discover(text);
        const expected: IBlock[] = [
            {
                name: "targetFunc",
                startLine: 2,
                endLine: 5
            }
        ];
        expect(actual).toEqual(expected);
    });

    it("discovers function prop", () => {
        const text = `
        var _ = {
            /* without params */
            targetFunc: function() {
                const x = 123;
                // some code goes here
            }
        }`;

        const actual = discover(text);
        const expected: IBlock[] = [
            {
                name: "targetFunc",
                startLine: 4,
                endLine: 7
            }
        ];
        expect(actual).toEqual(expected);
    });

    it("discovers function prop (es6)", () => {
        const text = `
        var _ = {
            /* without params */
            targetFunc() {
                const x = 123;
                // some code goes here
            }
        }`;

        const actual = discover(text);
        const expected: IBlock[] = [
            {
                name: "targetFunc",
                startLine: 4,
                endLine: 7
            }
        ];
        expect(actual).toEqual(expected);
    });

    it("discovers a function prop in dx-widget", () => {
        const text = `
        var Accordion = CollectionWidget.inherit({

            targetFunc: function() {
                this.callBase();

                this.option("selectionRequired", !this.option("collapsible"));
                this.option("selectionMode", this.option("multiple") ? "multiple" : "single");

                var $element = this.$element();
                $element.addClass(ACCORDION_CLASS);

                this._$container = $("<div>").addClass(ACCORDION_WRAPPER_CLASS);
                $element.append(this._$container);
            }
        });

        registerComponent("dxAccordion", Accordion);
        
        module.exports = Accordion;`;

        const actual = discover(text);
        const expected: IBlock[] = [
            {
                name: "targetFunc",
                startLine: 4,
                endLine: 15
            }
        ];
        expect(actual).toEqual(expected);
    });
});
