import React from 'react';

import LoanInput from '../../components/LoanInput/LoanInput';
import PaymentTable from '../../components/PaymentTable/PaymentTable';

export interface LoanState {
    principal: number;
    interestRate: number;
    loanLength: number;
    loanMonthlyPayment: number;
    [key: string]: number;
}

export interface CalculatorState {
    loans: Array<LoanState>;
    additionalPayment: number;
    applyClosedLoanPayment: boolean;
}

class Calculator extends React.Component {
    state: CalculatorState = {
        loans: [
            {
                principal: 10000,
                interestRate: 0.1,
                loanLength: 10,
                loanMonthlyPayment: 0,
            },
            {
                principal: 10000,
                interestRate: 0.05,
                loanLength: 10,
                loanMonthlyPayment: 0,
            },
            {
                principal: 10000,
                interestRate: 0.12,
                loanLength: 10,
                loanMonthlyPayment: 0,
            },
        ],
        additionalPayment: 0,
        applyClosedLoanPayment: true,
    }

    onChangeLoanInput = (field: string, newValue: number, idx: number) => {
        this.setState((prevState: CalculatorState) => {
            const prevLoan = [...prevState.loans];
            prevLoan[idx][field] = newValue;
            const newLoan = this.calculateMonthlyPayment(prevLoan[idx]);
            prevLoan[idx] = newLoan;
            return { loans: prevLoan };
        })
    }

    onChangePayment = (value: number) => {
        this.setState({ additionalPayment: value })
    }

    calculateMonthlyPayment = (loan: LoanState) => {
        let monthly = loan.principal / loan.loanLength;
        if (loan.interestRate !== 0) {
            const months = loan.loanLength;
            const rate = loan.interestRate / 12;
            const P = loan.principal;
            // const numerator = Math.pow(rate * P * (1 + rate), years);
            const numerator = rate * P;
            // const denominator = Math.pow((1 + rate), months) - 1;
            const denominator = 1 - Math.pow((1 + rate), -months);
            // console.log(numerator, denominator, numerator / denominator);

            monthly = numerator / denominator;
        }
        const newLoan = { ...loan };
        newLoan.loanMonthlyPayment = monthly;
        return newLoan;
    }

    addLoan = () => {
        this.setState((prevState: CalculatorState) => (
            {
                loans: [
                    ...prevState.loans,
                    {
                        principal: 0,
                        interestRate: 0,
                        loanLength: 1,
                        loanMonthlyPayment: 0,
                    }
                ]
            }
        ))
    }

    removeLoan = (idx: number) => {
        this.setState((prevState: CalculatorState) => {
            const newLoans = [...prevState.loans];
            newLoans.splice(idx, 1);
            return { loans: newLoans };
        })
    }

    componentDidMount() {
        this.setState((prevState: CalculatorState) => (
            { loans: prevState.loans.map(loan => this.calculateMonthlyPayment(loan)) })
        )
    }

    render() {
        const loans = this.state.loans;
        return (
            <>
                {loans.map((loan, idx) =>
                    <LoanInput
                        key={idx}
                        idx={idx}
                        principal={loan.principal}
                        interestRate={loan.interestRate}
                        loanLength={loan.loanLength}
                        monthlyPayment={loan.loanMonthlyPayment}
                        onChangeInput={this.onChangeLoanInput}
                        removeLoan={this.removeLoan}
                    />
                )}
                <div>
                    Additional Payment:
                    <input
                            type="number"
                            value={this.state.additionalPayment}
                            onChange={(event) => this.onChangePayment(+event.target.value)}
                            min="0"
                            step="1" />
                </div>
                <div>Total Monthly Payment (not including Additional Payment): {
                    loans.map(loan => loan.loanMonthlyPayment)
                        .reduce((total, monthly) => total + monthly)
                        .toFixed(2)
                }</div>
                {/* <div>Total Payment: {(loan.loanMonthlyPayment * loan.loanLength).toFixed(2)}</div> */}
                <button style={{ margin: "10px" }} onClick={this.addLoan}>Add Loan</button>
                <PaymentTable {...this.state}/>
            </>
        )
    }
}

export default Calculator;