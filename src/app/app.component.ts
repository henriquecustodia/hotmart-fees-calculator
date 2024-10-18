import { CurrencyPipe } from "@angular/common";
import { Component, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RouterOutlet } from "@angular/router";
import { debounce, debounceTime } from "rxjs";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <h1>Calcular preço final de curso na Hotmart</h1>

    <fieldset>
      <h3>Taxas</h3>

      <div>
        <input
          type="number"
          [formControl]="taxaParcelamentoEm12x"
          placeholder="taxa para parcelar em 12x"
        />%
      </div>

      <div>
        <input
          type="number"
          [formControl]="taxaIntermediacao"
          placeholder="taxa de intermediação"
        />%
      </div>

      <div>
        R$<input
          type="number"
          [formControl]="taxaLicenca"
          placeholder="taxa de licença"
        />
      </div>

      <div>
        R$<input
          type="number"
          [formControl]="taxaPlayerUnico"
          placeholder="player de pagamento único"
        />
      </div>
    </fieldset>

    <br />

    <fieldset>
      <div>
        <div>
          <label for="valorCobradoParceladoEm12x"
            >Valor cobrado parcelado em 12x</label
          >
        </div>
        R$<input
          id="valorCobradoParceladoEm12x"
          type="number"
          [formControl]="valorFinalParceladoEm12px"
          placeholder="valor final parcelado em 12x"
        />
      </div>
    </fieldset>

    <br>

    <div>
      Total líquido a receber: {{ valorLiquidoRecebido() | currency : "BRL" }}
    </div>
    <div>Total a ser cobrado: {{ valorCobrado() | currency : "BRL" }}</div>
  `,
  styles: [],
})
export class AppComponent {
  valorCobrado = signal(0);
  valorLiquidoRecebido = signal(0);

  valorFinalParceladoEm12px = new FormControl(0, { nonNullable: true });
  taxaParcelamentoEm12x = new FormControl(16.5, { nonNullable: true });
  taxaIntermediacao = new FormControl(9.9, { nonNullable: true });
  taxaLicenca = new FormControl(1, { nonNullable: true });
  taxaPlayerUnico = new FormControl(2.49, { nonNullable: true });

  constructor() {
    this.valorFinalParceladoEm12px.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.calcular();
    })
  }

  calcular() {
    const valorFinalParceladoEm12px = this.valorFinalParceladoEm12px.value;
    const taxaParcelamentoEm12x = this.taxaParcelamentoEm12x.value;
    const taxaIntermediacao = this.taxaIntermediacao.value;
    const taxaLicenca = this.taxaLicenca.value;
    const taxaPlayerUnico = this.taxaPlayerUnico.value;

    const totalMulplicadoEm12x = valorFinalParceladoEm12px * 12;
    const totalDescontadoTaxaParcelamento =
      totalMulplicadoEm12x * (1 - taxaParcelamentoEm12x / 100);
    const totalDescontadoTaxaIntermediação =
      totalDescontadoTaxaParcelamento * (1 - taxaIntermediacao / 100);
    const totalDescontadoTaxaLicenca =
      totalDescontadoTaxaIntermediação - taxaLicenca;
    const totalDescontadoTaxaPlayerUnico =
      totalDescontadoTaxaLicenca - taxaPlayerUnico;

    console.log("totalMulplicadoEm12x", totalMulplicadoEm12x);
    console.log(
      "totalDescontadoTaxaParcelamento",
      totalDescontadoTaxaParcelamento
    );
    console.log(
      "totalDescontadoTaxaIntermediação",
      totalDescontadoTaxaIntermediação
    );
    console.log("totalDescontadoTaxaLicenca", totalDescontadoTaxaLicenca);
    console.log(
      "totalDescontadoTaxaPlayerUnico",
      totalDescontadoTaxaPlayerUnico
    );

    this.valorLiquidoRecebido.set(totalDescontadoTaxaPlayerUnico);
    this.valorCobrado.set(totalMulplicadoEm12x);
  }
}
